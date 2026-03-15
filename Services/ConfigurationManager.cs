namespace Omnichannel.Services
{
    public class ConfigurationManager
    {
        private static ConfigurationManager? _instance;
        private static readonly object _lock = new object();

        private ConfigurationManager() { }

        public static ConfigurationManager Instance
        {
            get
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new ConfigurationManager();
                    }
                    return _instance;
                }
            }
        }

        public string BrandName { get; set; } = "KP Luxury Perfume";
        public string Currency { get; set; } = "USD";
    }
}
