using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace ETutoring.Business.Dtos.Auth;

public class LoginRequest
{
    [EmailAddress]
    public string Email { get; set; }

    [PasswordPropertyText]
    public string Password { get; set; }
}