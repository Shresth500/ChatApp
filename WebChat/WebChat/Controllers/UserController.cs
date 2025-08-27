using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebChat.Common;
using WebChat.DTOs;
using WebChat.Models;
using WebChat.Repository;

namespace WebChat.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController(IUserRepo repo,IHttpContextAccessor context, UserManager<AppUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAuthorizedUser()
    {
        var currentLoggedInUserId = context!.HttpContext!.User.GetUserId()!;
        var currentLoggedInUser = await userManager.Users.SingleOrDefaultAsync(x => x.Id == currentLoggedInUserId.ToString());
        return Ok(RegisterResponseDto<AppUser>.Success(currentLoggedInUser!,"User fetched successfully."));
    }
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto imageUploadRequestDto)
    {
        var validatingImage = imageUploadRequestDto.CheckImageExtensions();
        if (validatingImage == 0)
            return StatusCode(StatusCodes.Status415UnsupportedMediaType, "File With extensions '.jpg','.jpeg' and '.png' is only supported");
        else if (validatingImage == 2)
            return BadRequest("Image Size Can't exceed more than 10MB");

        var id = User!.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var profileImage = await repo.UploadProductImagesAsync(id, imageUploadRequestDto.ProfileImage);
        return Ok(profileImage);
    }
}