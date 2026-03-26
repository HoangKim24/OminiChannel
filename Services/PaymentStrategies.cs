using System.Threading.Tasks;
using Omnichannel.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Globalization;

namespace Omnichannel.Services
{
    public interface IPaymentStrategy
    {
        Task<string> ProcessPaymentAsync(Order order);
    }

    public class CreditCardPayment : IPaymentStrategy
    {
        public async Task<string> ProcessPaymentAsync(Order order)
        {
            // Simulating CC processing
            return await Task.FromResult("CreditCard-Success");
        }
    }

    public class EWalletPayment : IPaymentStrategy
    {
        public async Task<string> ProcessPaymentAsync(Order order)
        {
            // Simulating E-Wallet processing
            return await Task.FromResult("EWallet-Success");
        }
    }

    public class VNPayStrategy : IPaymentStrategy
    {
        private readonly IConfiguration _configuration;

        public VNPayStrategy(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task<string> ProcessPaymentAsync(Order order)
        {
            var vnp_TmnCode = _configuration["VNPay:TmnCode"];
            var vnp_HashSecret = _configuration["VNPay:HashSecret"];
            var vnp_Url = _configuration["VNPay:BaseUrl"];
            var vnp_Returnurl = _configuration["VNPay:ReturnUrl"];

            // 1. Initialize parameters
            var vnp_Params = new SortedList<string, string>(new VNPayCompare())
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", vnp_TmnCode },
                { "vnp_Amount", ((long)(order.TotalAmount * 100)).ToString() }, // Amount in VND * 100
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", "127.0.0.1" },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", $"Thanh toan don hang {order.Id}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", vnp_Returnurl },
                { "vnp_TxnRef", order.Id.ToString() }
            };

            // 2. Build QueryString and Hash
            var querystring = new StringBuilder();
            var hashData = new StringBuilder();

            foreach (var kv in vnp_Params)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    querystring.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                    hashData.Append(kv.Key + "=" + kv.Value + "&");
                }
            }

            var query = querystring.ToString().TrimEnd('&');
            var hashQuery = hashData.ToString().TrimEnd('&');
            var vnp_SecureHash = HmacSHA512(vnp_HashSecret, hashQuery);

            query += "&vnp_SecureHash=" + vnp_SecureHash;

            var paymentUrl = vnp_Url + "?" + query;

            return Task.FromResult(paymentUrl);
        }

        private string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }
    }

    public class VNPayCompare : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}
