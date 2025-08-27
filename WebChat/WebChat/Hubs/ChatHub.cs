using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WebChat.Common;
using WebChat.Data;
using WebChat.DTOs;
using WebChat.Models;

namespace WebChat.Hubs;

[Authorize]
public class ChatHub(UserManager<AppUser> userManager, ApplicationDbContext context) : Hub
{
    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUser = new();
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var receiveId = httpContext?.Request.Query["senderId"].ToString();
        var UserName = Context.User!.Identity!.Name!;
        var currentUser = await userManager.FindByNameAsync(UserName);
        var ConnectionId = Context.ConnectionId;
        await Clients.AllExcept(ConnectionId).SendAsync("Notify", currentUser);
        if (onlineUser.ContainsKey(UserName))
            onlineUser[UserName].ConnectionId = ConnectionId;
        else
        {
            var user = new OnlineUserDto
            {
                ConnectionId = ConnectionId,
                UserName = UserName,
                ProfileImagePath = currentUser!.ProfileImagePath,
                FullName = currentUser!.FullName
            };
            onlineUser.TryAdd(UserName, user);
        }

        if (!string.IsNullOrEmpty(receiveId))
            await LoadMessages(receiveId);

        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }
    public async Task SendMessage(MessageRequestDto message)
    {
        var senderId = Context.User!.Identity!.Name!;
        var receiverId = message.ReceiverId;
        var newMessage = new Messages
        {
            Sender = await userManager.FindByNameAsync(senderId!),
            Receiver = await userManager.FindByIdAsync(receiverId!),
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Content = message.Content
        };
        await context.Messages.AddAsync(newMessage);
        await context.SaveChangesAsync();

        await Clients.User(receiverId!).SendAsync("ReceiveMessage", newMessage);
    }
    public async Task LoadMessages(string receiveId, int pageNumber = 1)
    {
        int pageSize = 10;
        var username = Context.User!.Identity!.Name;
        var currentUser = await userManager.FindByNameAsync(username!);

        if (currentUser is null) return;
        var messages = await context.Messages
                            .Where(x =>
                                (x.ReceiverId == currentUser!.Id && x.SenderId == receiveId) ||
                                (x.SenderId == currentUser!.Id && x.ReceiverId == receiveId))
                            .OrderBy(x => x.CreatedAt) // consistent ascending order
                            .Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .Select(x => new MessageResponseDto {
                                Id = x.Id,
                                Content = x.Content,
                                CreatedAt = x.CreatedAt,
                                ReceiverId = x.ReceiverId,
                                SenderId = x.SenderId
                            })
                            .ToListAsync();


        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(x => x.Id == message.Id);
            if (msg is not null && msg.ReceiverId == receiveId)
            {
                msg.IsRead = true;
                await context.SaveChangesAsync();
            }
        }
        await Clients.User(currentUser.Id).SendAsync("ReceiveMessageList", messages);
    }
    public async Task NotifyTyping(string recepientUserName)
    {
        var senderUserName = Context.User!.Identity!.Name!;
        if (senderUserName is null)
            return;

        var connectionId = onlineUser.Values.FirstOrDefault(x => x.UserName == recepientUserName)?.ConnectionId;
        if (connectionId is not null)
        {
            await Clients.Client(connectionId).SendAsync("NotifyTypingToUser", senderUserName);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User!.Identity!.Name!;
        onlineUser.TryRemove(username!, out _);
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }
    private async Task<List<OnlineUserDto>> GetAllUsers()
    {
        var username = Context.User!.GetUserName();
        var userid = Context.User!.GetUserId();
        var onlineUsersSet = new HashSet<string>(onlineUser.Keys);
        var users = await userManager.Users.Select(u => new OnlineUserDto
        {
            Id = u.Id,
            UserName = u.UserName,
            FullName = u.FullName,
            ProfileImagePath = u.ProfileImagePath,
            IsOnline = onlineUsersSet.Contains(u.UserName!),
            UnreadCount = context.Messages.Count(x => x.ReceiverId == username && x.SenderId == u.Id && !x.IsRead)
        }).OrderByDescending(u => u.IsOnline)
        .ToListAsync();
        return users;
    }

}