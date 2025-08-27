namespace WebChat.Models;

public class Messages
{
    public int Id { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public string? Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public AppUser? Sender { get; set; }
    public AppUser? Receiver { get; set; }
}