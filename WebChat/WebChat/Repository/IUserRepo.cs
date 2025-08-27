using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebChat.Models;

namespace WebChat.Repository;

public interface IUserRepo
{
    Task<string> UploadProductImagesAsync(string userId, IFormFile file);
    Task<AppUser> GetAuthorizedUserAsync(string userId);
    Task<List<AppUser>> GetAllUserAsync(string userid);
    Task<AppUser> GetUserById(string receiverid);
}