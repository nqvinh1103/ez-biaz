namespace EzBias.Application.Common.Interfaces.Storage;

public interface IImageStorage
{
    Task<string> UploadImageAsync(Stream stream, string fileName, string contentType, string folder, CancellationToken cancellationToken = default);
}
