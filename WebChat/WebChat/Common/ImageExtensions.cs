using WebChat.DTOs;

namespace WebChat.Common;

public static class ImageExtensions
{
    public static int CheckImageExtensions(this ImageUploadRequestDto ProfileImage)
    {
        var result = ValidateImages(ProfileImage);
        return result;
    }

    public static int ValidateImages(ImageUploadRequestDto imageUploadRequestDto)
    {
        var allowedExtensions = new string[] { ".jpg", ".jpeg", ".png" };
        if (!allowedExtensions.Contains(Path.GetExtension(imageUploadRequestDto.ProfileImage.FileName)))
            return 0;
        if (imageUploadRequestDto.ProfileImage.Length > 10 * 1024 * 1024)
            return 2;

        return 1;
    }

}