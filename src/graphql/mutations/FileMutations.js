import { gql } from "@apollo/client";

const UPLOAD_MULTIPLE_FILES = gql`
  mutation UploadMultipleImages($files: [Upload!]!) {
    uploadMultipleImages(files: $files) {
      image_url
      thumbnail_url
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      image_url
      thumbnail_url
    }
  }
`;

const REMOVE_FILE = gql`
  mutation RemoveSingleImage($imageUrl: String!) {
    removeSingleImage(imageUrl: $imageUrl) {
      image_url
      thumbnail_url
    }
  }
`;
const FileMutations = {
  UPLOAD_MULTIPLE_FILES,
  UPLOAD_FILE,
  REMOVE_FILE,
};

export default FileMutations;
