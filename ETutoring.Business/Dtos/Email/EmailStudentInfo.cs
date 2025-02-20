namespace ETutoring.Business.Dtos.Email;

public class EmailStudentInfo
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }

    public EmailStudentInfo(Guid userId, string email, string name)
    {
        UserId = userId;
        Email = email;
        Name = name;
    }
}