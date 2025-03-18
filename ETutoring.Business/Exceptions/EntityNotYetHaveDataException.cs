namespace ETutoring.Business.Exceptions;

public class EntityNotYetHaveDataException : Exception
{
    public EntityNotYetHaveDataException(string message)
        : base(message)
    {
    }

}