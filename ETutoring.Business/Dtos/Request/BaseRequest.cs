using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request
{
    public class BaseRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Size must be between 1 and 100.")]
        public int Size { get; set; } = 10;

        public string? Sort { get; set; } = string.Empty; // Mặc định sắp xếp theo ngày tạo
    }

}
