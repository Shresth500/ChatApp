using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebChat.DTOs;
using WebChat.Models;
using WebChat.Repository;

namespace WebChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ILogger<AuthController> logger,
                            UserManager<AppUser> userManager,
                            IAuthRepo repo) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromForm] RegisterRequestDto registerRequestDto)
    {
        var data = await userManager.FindByEmailAsync(registerRequestDto.Email!);
        if (data != null)
        {
            logger.LogWarning("Email doesnot exists {email}", registerRequestDto.Email);
            return BadRequest("Email Already exists");
        }
        if (registerRequestDto.ProfileImage is null)
            return BadRequest("Profile Image is needed");
        var user = new AppUser
        {
            UserName = registerRequestDto.UserName,
            FullName = registerRequestDto.FullName!,
            Email = registerRequestDto.Email!.ToLower()
        };
        var result = await userManager.CreateAsync(user, registerRequestDto.Password!);
        if (!result.Succeeded)
        {
            logger.LogWarning("Unable to create User");
            return BadRequest(RegisterResponseDto<string>.Failure
            (result.Errors.Select(x => x.Description).FirstOrDefault()));
        }
        var file = await repo.UploadProductImagesAsync(user, registerRequestDto.ProfileImage);
        logger.LogInformation("Successfully created a user with email : {email} and fullname : {fullname}", registerRequestDto.Email, registerRequestDto.FullName);
        return Ok(RegisterResponseDto<string>.Success("", "User Created Successfully"));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
    {
        var user = await userManager.FindByEmailAsync(loginRequestDto.Email);
        if (user == null)
            return BadRequest("Email not Found");

        var checkPasswordResult = await userManager.CheckPasswordAsync(user, loginRequestDto.Password);
        if (!checkPasswordResult)
            return BadRequest("Enter Correct Password");

        var accessToken = repo.GenerateAccessToken(user.Id, user.Email!, user.UserName!);
        return Ok(new LoginResponseDto
        {
            Id = user.Id,
            Email = user.Email!,
            Username = user.UserName!,
            AccessToken = accessToken,
            ImageFilePath = user.ProfileImagePath
        });

    }

}