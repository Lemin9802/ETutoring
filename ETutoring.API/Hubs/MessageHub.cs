using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ETutoring.API.Hubs
{
    public class MessageHub : Hub
    {
        private static ConcurrentDictionary<string, HashSet<string>> UserConnections = new();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                UserConnections.AddOrUpdate(
                    userId,
                    _ => new HashSet<string> { Context.ConnectionId },
                    (_, connections) => { connections.Add(Context.ConnectionId); return connections; }
                );

                Console.WriteLine($"User {userId} connected with ConnectionId: {Context.ConnectionId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userEntry = UserConnections.FirstOrDefault(x => x.Value.Contains(Context.ConnectionId));
            if (!string.IsNullOrEmpty(userEntry.Key))
            {
                if (UserConnections.TryGetValue(userEntry.Key, out var connections))
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        UserConnections.Remove(userEntry.Key, out _);
                    }
                }
                Console.WriteLine($"User {userEntry.Key} disconnected.");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string sender, string receiver, string message)
        {
            Console.WriteLine($"Sending message from {sender} to {receiver}: {message}");

            var tasks = new List<Task>();

            // Gửi tin nhắn cho người nhận
            if (UserConnections.TryGetValue(receiver, out var receiverConnections))
            {
                tasks.Add(Clients.Clients(receiverConnections.ToList()).SendAsync("ReceiveMessage", sender, receiver, message));
                Console.WriteLine($"Message sent to receiver {receiver}");
            }

            // Gửi tin nhắn cho người gửi để cập nhật UI (trừ trường hợp sender == receiver)
            if (sender != receiver && UserConnections.TryGetValue(sender, out var senderConnections))
            {
                tasks.Add(Clients.Clients(senderConnections.ToList()).SendAsync("ReceiveMessage", sender, receiver, message));
                Console.WriteLine($"Message also sent to sender {sender} for UI update");
            }

            await Task.WhenAll(tasks);
        }



        public async Task AssignChatroom(string studentId, string tutorId)
        {
            string roomName = $"{studentId}-{tutorId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("ChatroomAssigned", studentId, tutorId);
        }

        public async Task JoinChatroom(string userId, string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserJoined", userId);
        }

        public async Task LeaveChatroom(string userId, string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserLeft", userId);
        }
    }

}