using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response
{
    public class BaseResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public long Took { get; set; }
        public long Total { get; set; }
        public BaseResponse() { }

        public BaseResponse(int statusCode, string message, object? data = null, long took = 0, long total = 0)
        {
            StatusCode = statusCode;
            Message = message;
            Data = data;
            Took = took;
            Total = total;
        }
    }
}