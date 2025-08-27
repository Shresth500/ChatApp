using WebChat.DTOs;
using WebChat.Models;

namespace WebChat.Repository;

public interface IAuthRepo
{
    string GenerateAccessToken(string id, string email, string username);
    Task<string> UploadProductImagesAsync(AppUser appUser, IFormFile file);
}