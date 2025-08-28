using System.ComponentModel.DataAnnotations.Schema;

namespace WebChat.Models;

public class Status
{
    public int Id { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string? StatName { get; set; }
    [NotMapped]
    public IFormFile? Stat { get; set; }
    public string? StatImagePath { get; set; }
    public DateTime CreatedAt { get; set; }
    public AppUser? Sender { get; set; }
    public List<StatusUpdate>? StatusUpdate{ get; set; } 
}