namespace ETutoring.Business.Exceptions;

public class EntityNotHaveDataException : Exception
{
    public EntityNotHaveDataException(string entityName, Guid id)
        : base($"{entityName} with ${id} does not have any data.")
    {
    }
}