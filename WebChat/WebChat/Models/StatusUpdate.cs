namespace WebChat.Models
{
    public class StatusUpdate
    {
        public int Id { get; set; }
        public int StatusId { get; set; }
        public string ReceiverId { get; set; } = string.Empty;
        public Status? Status { get; set; }
        public AppUser? Receiver { get; set; }
    }
}