import ImageKit from "imagekit";

let imagekit: ImageKit | null = null;

export function getImageKit() {
    if (imagekit) {
        return imagekit;
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error(
            "Missing ImageKit credentials. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT."
        );
    }

    imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
    });

    return imagekit;
}
