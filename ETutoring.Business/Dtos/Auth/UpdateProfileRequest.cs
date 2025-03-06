using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Auth
{
    public class UpdateProfileRequest
    {
        [StringLength(100, MinimumLength = 3)]
        public string? FullName { get; set; }

        [StringLength(255)]
        public string? Address { get; set; }

        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        [StringLength(255)]
        public string? ProfilePicture { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }
    }
}
