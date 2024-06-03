import { gql } from "@apollo/client";

const UPLOAD_MULTIPLE_IMAGES = gql`
  mutation UploadMultipleImages($files: [Upload!]!) {
    uploadMultipleImages(files: $files) {
      image_url
      thumbnail_url
    }
  }
`;

const UPLOAD_SINGLE_IMAGE = gql`
  mutation UploadSingleImage($file: Upload!) {
    uploadSingleImage(file: $file) {
      image_url
      thumbnail_url
    }
  }
`;

const REMOVE_SINGLE_IMAGE = gql`
  mutation RemoveSingleImage($imageUrl: String!) {
    removeSingleImage(imageUrl: $imageUrl) {
      image_url
      thumbnail_url
    }
  }
`;
const ImageMutations = {
  UPLOAD_MULTIPLE_IMAGES,
  UPLOAD_SINGLE_IMAGE,
  REMOVE_SINGLE_IMAGE,
};

export default ImageMutations;
