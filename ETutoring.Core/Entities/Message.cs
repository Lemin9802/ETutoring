using System;
using System.ComponentModel.DataAnnotations;

namespace ETutoring.Core.Entities
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string SenderId { get; set; }

        [Required]
        public string ReceiverId { get; set; }

        [Required]
        public string Content { get; set; }
        public Guid? ChatroomId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
        public ChattingRoom Chatroom { get; set; }
    }
}