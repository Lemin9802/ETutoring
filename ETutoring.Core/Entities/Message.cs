using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ETutoring.Core.Entities
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid SenderId { get; set; }

        public Guid ReceiverId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Content { get; set; }

        public Guid? ChatroomId { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        public ChattingRoom Chatroom { get; set; }
    }
}