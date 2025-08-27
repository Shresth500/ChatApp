using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace WebChat.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    [NotMapped]
    public IFormFile? ProfileImage { get; set; }
    public string? ProfileImagePath { get; set; }
    public string? ImageExtension { get; set; }
    public long ImageSizeInBytes { get; set; }
}