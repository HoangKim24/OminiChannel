using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Omnichannel.Swagger
{
    public class SwaggerDefaultResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            AddResponse(operation, "400", "Bad request", "Validation failed");
            AddResponse(operation, "401", "Unauthorized", "Unauthorized");
            AddResponse(operation, "500", "Server error", "An unexpected error occurred");
        }

        private static void AddResponse(OpenApiOperation operation, string statusCode, string description, string sampleMessage)
        {
            if (operation.Responses.ContainsKey(statusCode))
            {
                return;
            }

            operation.Responses[statusCode] = new OpenApiResponse
            {
                Description = description,
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/json"] = new OpenApiMediaType
                    {
                        Example = new OpenApiObject
                        {
                            ["message"] = new OpenApiString(sampleMessage)
                        }
                    }
                }
            };
        }
    }
}
