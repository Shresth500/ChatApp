using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WebChat.Data;
using WebChat.DTOs;
using WebChat.Models;

namespace WebChat.Repository;

public class AuthRepo(IConfiguration configuration, ApplicationDbContext db, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor) : IAuthRepo
{
    public string GenerateAccessToken(string id, string email, string username)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier,id.ToString()),
            new Claim(ClaimTypes.Email,email),
            new Claim(ClaimTypes.Name,username)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var accessToken = new JwtSecurityToken(
            configuration["Jwt:Issuer"],
            configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddMinutes(15),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(accessToken);
    }

    public async Task<string> UploadProductImagesAsync(AppUser appUser, IFormFile file)
    {

        var folderPath = Path.Combine(env.ContentRootPath, "Images", appUser.Id);
        Directory.CreateDirectory(folderPath);

        var fileName = $"{appUser.UserName}{Path.GetExtension(file.FileName)}";
        var localFilePath = Path.Combine(folderPath, fileName);

        using var stream = new FileStream(localFilePath, FileMode.Create);
        await file.CopyToAsync(stream);

        appUser.ImageExtension = Path.GetExtension(file.FileName);
        appUser.ImageSizeInBytes = file.Length;
        appUser.ProfileImagePath =
            $"{httpContextAccessor.HttpContext!.Request.Scheme}://" +
            $"{httpContextAccessor.HttpContext.Request.Host}" +
            $"{httpContextAccessor.HttpContext.Request.PathBase}/Images/{appUser.Id}/{fileName}";

        await db.SaveChangesAsync();

        return appUser.ProfileImagePath!;
    }

}