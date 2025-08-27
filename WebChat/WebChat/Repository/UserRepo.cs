
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using WebChat.Data;
using WebChat.Models;

namespace WebChat.Repository;

public class UserRepo(ApplicationDbContext db, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor) : IUserRepo
{
    public async Task<string> UploadProductImagesAsync(string userId, IFormFile file)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null) throw new UnauthorizedAccessException("Unauthorized");

        var folderPath = Path.Combine(env.ContentRootPath, "Images", userId);
        Directory.CreateDirectory(folderPath);

        var fileName = $"{user.UserName}{Path.GetExtension(file.FileName)}";
        var localFilePath = Path.Combine(folderPath, fileName);

        RemoveImage(localFilePath);

        using var stream = new FileStream(localFilePath, FileMode.Create);
        await file.CopyToAsync(stream);

        user.ImageExtension = Path.GetExtension(file.FileName);
        user.ImageSizeInBytes = file.Length;
        user.ProfileImagePath =
            $"{httpContextAccessor.HttpContext!.Request.Scheme}://" +
            $"{httpContextAccessor.HttpContext.Request.Host}" +
            $"{httpContextAccessor.HttpContext.Request.PathBase}/Images/{userId}/{fileName}";

        await db.SaveChangesAsync();

        return user.ProfileImagePath!;
    }
    public void RemoveImage(string filePath)
    {
        if (File.Exists(filePath))
            File.Delete(filePath);
        else
            throw new Exception("File not Found");
    }

    public async Task<AppUser> GetAuthorizedUserAsync(string userId)
    {
        var data = await db.Users.FirstOrDefaultAsync(x => x.Id == userId);
        return data!;
    }

    public async Task<List<AppUser>> GetAllUserAsync(string userid)
    {
        var data = await db.Users.Where(x => x.Id != userid).ToListAsync();
        return data;
    }

    public async Task<AppUser> GetUserById(string receiverid)
    {
        var data = await db.Users.FirstOrDefaultAsync(x => x.Id == receiverid);
        return data!;
    }
}
