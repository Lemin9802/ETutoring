namespace ETutoring.Business.Exceptions;

public class AuthErrorException : Exception
{
    public AuthErrorException(string message) : base(message)
    {
    }
}