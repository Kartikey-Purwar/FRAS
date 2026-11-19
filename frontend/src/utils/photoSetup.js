export function isPhotoSetupComplete(photoSetup) {
  return Boolean(photoSetup?.liveCaptured && photoSetup?.uploaded)
}
