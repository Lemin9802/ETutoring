using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Interfaces.Message;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ETutoring.API.Controllers.Message
{
    [Route("api/messages")]
    [ApiController]
    public partial class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessageController(IMessageService messageService)
        {
            _messageService = messageService;
        }



        [HttpPost("get-all")]
        public async Task<IActionResult> GetUserConversations([FromBody] GetConversationsRequest request)
        {
            try
            {
                var response = await _messageService.GetUserConversationsAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserConversations: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("get-messages")]
        public async Task<IActionResult> GetUserMessages([FromBody] GetMessagesRequest request)
        {
            try
            {
                // Kiểm tra input
                if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.ParticipantId))
                {
                    return BadRequest(new { Message = "UserId and ParticipantId are required." });
                }

                var response = await _messageService.GetUserMessagesAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi
                Console.WriteLine($"Error in GetUserMessages: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message, StackTrace = ex.StackTrace });
            }
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var response = await _messageService.SendMessageAsync(request);
                if (!response.Success)
                {
                    return StatusCode(400, response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("delete")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> DeleteMessage([FromBody] DeleteMessageRequest request)
        {
            try
            {
                var response = await _messageService.DeleteMessageAsync(request);
                if (!response.Success)
                {
                    return NotFound(response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteMessage: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }
    }
}
