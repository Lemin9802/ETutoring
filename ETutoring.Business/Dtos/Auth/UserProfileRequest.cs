using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Auth
{
    public class UserProfileRequest
    {
        [Required]
        public Guid Id { get; set; }

        public UserProfileRequest(Guid id)
        {
            Id = id;
        }
    }
}
