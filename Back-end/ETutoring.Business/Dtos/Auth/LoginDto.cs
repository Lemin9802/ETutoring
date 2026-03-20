using System.ComponentModel.DataAnnotations;

namespace ETutoring.Business.Dtos.Auth;

public class LoginDto
{
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }

    public bool? RememberMe { get; set; }

    public LoginDto(string email, string password, bool rememberMe = false)
    {
        Email = email;
        Password = password;
        RememberMe = rememberMe;
    }
}