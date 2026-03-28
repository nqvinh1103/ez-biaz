using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EzBias.Application.Common.Interfaces.Storage;

namespace EzBias.Infrastructure.Services.Images;

public class CloudinaryImageStorage : IImageStorage
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageStorage(string cloudinaryUrl)
    {
        _cloudinary = new Cloudinary(cloudinaryUrl);
        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadImageAsync(Stream stream, string fileName, string contentType, string folder, CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, stream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (result.Error is not null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return result.SecureUrl?.ToString() ?? result.Url?.ToString() ?? throw new InvalidOperationException("Cloudinary did not return a URL.");
    }
}
