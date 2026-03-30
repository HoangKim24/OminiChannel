using System.Linq;
using Omnichannel.Models;
using Omnichannel.Validators;
using Xunit;

namespace Omnichannel.Tests
{
    public class ValidatorTests
    {
        [Fact]
        public void CreateCommentValidator_ValidRequest_ShouldNotHaveErrors()
        {
            var validator = new CreateCommentValidator();
            var req = new CreateCommentRequest { PerfumeId = 1, UserName = "Kim", Text = "Great", Stars = 5 };
            var result = validator.Validate(req);
            Assert.True(result.IsValid);
        }

        [Fact]
        public void CreateCommentValidator_InvalidStars_ShouldHaveError()
        {
            var validator = new CreateCommentValidator();
            var req = new CreateCommentRequest { PerfumeId = 1, UserName = "Kim", Text = "Great", Stars = 6 };
            var result = validator.Validate(req);
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Stars");
        }

        [Fact]
        public void RegisterRequestValidator_ShortPassword_ShouldHaveError()
        {
            var validator = new RegisterRequestValidator();
            var req = new RegisterRequest { Username = "TestUser", Password = "123" };
            var result = validator.Validate(req);
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Password");
        }
    }
}
