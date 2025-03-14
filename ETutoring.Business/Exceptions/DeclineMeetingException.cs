namespace ETutoring.Business.Exceptions;

public class DeclineMeetingException : Exception
{
    public DeclineMeetingException() : base("You must be a tutor to decline the meeting.")
    {
    }
}