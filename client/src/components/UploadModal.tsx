import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadVideoSchema, type UploadVideo } from "@shared/schema";
import {
  uploadVideo,
  prepareVideoUpload,
  uploadDirectToIPFS,
  type DirectUploadResponse,
} from "@/lib/stratosSdk";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { withOptionalAuth } from "@/lib/withAuth";
import { AuthContextType } from "@/lib/authContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMySpaceItemAutoType } from "@/utils/localStorageData";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth?: AuthContextType | null;
  onUpload: (
    file: File,
    title: string,
    description: string,
    category: string
  ) => void;
}

// Steps in the upload process
enum UploadStep {
  SelectFile,
  Details,
  Publishing,
  Complete,
}

// Default categories for videos
// const VIDEO_CATEGORIES = [
//   "Blockchain",
//   "Tutorials",
//   "Crypto",
//   "Web3",
//   "DeFi",
//   "NFTs",
//   "Technology",
//   "Entertainment",
//   "Education",
//   "Other",
// ];

function UploadModalComponent({
  isOpen,
  onClose,
  auth,
  onUpload,
}: UploadModalProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>(
    UploadStep.SelectFile
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Setup form for video details
  const form = useForm<UploadVideo>({
    resolver: zodResolver(uploadVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Blockchain",
    },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // // Check if file is a video
    // if (!file.type.startsWith("video/")) {
    //   toast({
    //     title: "Invalid file type",
    //     description: "Please select a video file",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // // Check file size (max 500MB)
    // if (file.size > 500 * 1024 * 1024) {
    //   toast({
    //     title: "File too large",
    //     description: "Maximum file size is 500MB",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setSelectedFile(file);

    // Auto-fill title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    form.setValue("title", fileName.replace(/[-_]/g, " "));

    // Move to next step
    setCurrentStep(UploadStep.Details);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle thumbnail selection
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid thumbnail format",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Thumbnail too large",
        description: "Maximum thumbnail size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedThumbnail(file);
  };

  // Trigger thumbnail input click
  const triggerThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  // Handle form submission
  const onSubmit = async (data: UploadVideo) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setCurrentStep(UploadStep.Publishing);

      let dataRes;

      // If the user is authenticated, use the normal upload flow
      // if (auth?.isAuthenticated) {
      if (true) {
        // Prepare form data with file and metadata (and optional thumbnail)
        const formData = prepareVideoUpload(
          data,
          selectedFile,
          selectedThumbnail
        );

        // Upload the video with progress tracking through the authenticated endpoint
        dataRes = await uploadVideo(formData, (progress) => {
          setUploadProgress(progress - 1);
        });
        console.log(`dataRes: ${dataRes}`);

        // add to local storage
        addMySpaceItemAutoType(dataRes);
      }
      // Otherwise use the direct IPFS upload without authentication
      else {
        // First upload the file directly to IPFS
        const ipfsUploadResponse = await uploadDirectToIPFS(
          selectedFile,
          (progress) => {
            // Show first half of progress for the file upload
            setUploadProgress(Math.floor(progress / 2));
          }
        );

        // After successful IPFS upload, create a video record in the database
        // with the minimal required metadata
        const videoMetadata = {
          title: data.title,
          description: data.description || "",
          category: data.category || "Other",
          fileHash: ipfsUploadResponse.fileHash,
          fileUri: ipfsUploadResponse.fileUri,
          thumbnailUri: null, // No automatic thumbnail for direct uploads
          size: ipfsUploadResponse.size,
          duration: 0,
          userId: 1, // Use default user ID for unauthenticated uploads
        };

        // Show the direct upload response information
        video = {
          id: Date.now(), // Use a temporary ID for display purposes
          ...videoMetadata,
          ...ipfsUploadResponse,
          views: 0,
          createdAt: new Date().toISOString(),
        };

        // Complete progress to 100%
        setUploadProgress(100);
      }

      // Store the uploaded video data

      const videoMetadata = {
        title: data.title,
        description: data.description || "",
        category: data.category || "Other",
        fileHash: dataRes?.fileHash,
        fileUri: dataRes?.fileUri,
        thumbnailUri: null, // No automatic thumbnail for direct uploads
        size: dataRes?.size,
        duration: 0,
        userId: 1, // Use default user ID for unauthenticated uploads
      };

      // Show the direct upload response information
      let video = {
        id: Date.now(), // Use a temporary ID for display purposes
        ...videoMetadata,
        ...dataRes,
        views: 0,
        createdAt: new Date().toISOString(),
      };

      // Complete progress to 100%
      setUploadProgress(100);
      setUploadedVideo(video);

      // Move to completion step
      setCurrentStep(UploadStep.Complete);

      // Invalidate videos query to refresh the list
      // queryClient.invalidateQueries({ queryKey: ["/api/videos"] });

      toast({
        title: "Upload successful",
        description: "Your video has been uploaded successfully to IPFS",
      });

      onUpload(
        selectedFile,
        data.title,
        data?.description || "",
        data?.category || ""
      );
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });

      console.error("Upload error:", error);

      // Go back to details step on error
      setCurrentStep(UploadStep.Details);
    }
  };

  // Go to previous step
  const handleBack = () => {
    if (currentStep === UploadStep.Details) {
      setCurrentStep(UploadStep.SelectFile);
    }
  };

  // Reset the modal state when closed
  const handleClose = () => {
    setCurrentStep(UploadStep.SelectFile);
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadProgress(0);
    setUploadedVideo(null);
    form.reset();
    onClose();
  };

  // View the uploaded video
  // const viewVideo = () => {
  //   if (uploadedVideo) {
  //     // For videos with videoId (now included in both direct uploads and regular uploads)
  //     if (uploadedVideo.videoId) {
  //       handleClose();
  //       navigate(`/video/${uploadedVideo.videoId}`);
  //     }
  //     // For direct uploads that failed to save to database but have streaming URL
  //     else if (uploadedVideo.directStreamUrl) {
  //       // Open the direct streaming URL in a new tab
  //       window.open(uploadedVideo.directStreamUrl, "_blank");
  //       handleClose();
  //     }
  //     // For videos uploaded through the regular flow (legacy code path)
  //     else if (uploadedVideo.id) {
  //       handleClose();
  //       navigate(`/video/${uploadedVideo.id}`);
  //     }
  //   }
  // };

  // Render the steps progress indicator
  const renderStepsProgress = () => {
    return (
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                currentStep >= UploadStep.SelectFile
                  ? "bg-primary"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              1
            </div>
            <span className="mt-2 text-sm">Select File</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-neutral-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: currentStep > UploadStep.SelectFile ? "100%" : "0%",
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                currentStep >= UploadStep.Details
                  ? "bg-primary"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              2
            </div>
            <span className="mt-2 text-sm">Details</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-neutral-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: currentStep > UploadStep.Details ? "100%" : "0%",
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                currentStep >= UploadStep.Complete
                  ? "bg-primary"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              3
            </div>
            <span className="mt-2 text-sm">Publish</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Upload File
          </DialogTitle>
        </DialogHeader>

        {renderStepsProgress()}

        {/* Step 1: File Selection */}
        {currentStep === UploadStep.SelectFile && (
          <div
            className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add("border-primary");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-primary");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-primary");

              const files = e.dataTransfer.files;
              if (!files || files.length === 0) return;

              // 如果拖入多个文件，显示错误提示
              if (files.length > 1) {
                toast({
                  title: "Only one file allowed",
                  description: "Please upload only one file at a time",
                  variant: "destructive",
                });
                return;
              }

              const file = files[0];
              setSelectedFile(file);

              // Auto-fill title from filename
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              form.setValue("title", fileName.replace(/[-_]/g, " "));

              // Move to next step
              setCurrentStep(UploadStep.Details);
            }}
          >
            <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drop a file here, or click to select
            </h3>
            <p className="text-neutral-600 mb-4">
              Only one file can be uploaded at a time
            </p>
            <Button
              onClick={triggerFileInput}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-6"
            >
              SELECT FILE
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              multiple={false} // 禁用多文件选择
            />
            <p className="mt-6 text-sm text-neutral-500">
              By uploading a file, you acknowledge that you agree to Stratos
              File's Terms of Service
            </p>
          </div>
        )}

        {/* Step 2: File Details */}
        {currentStep === UploadStep.Details && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (required)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add a title that describes your file"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell viewers about your file"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {VIDEO_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

                <div>
                  <div className="bg-neutral-100 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Upload Status</h3>
                    <div className="mb-2">
                      <p className="text-sm font-medium"> File:</p>
                      <p className="text-sm text-neutral-600 truncate">
                        {selectedFile?.name}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium">File size:</p>
                      <p className="text-sm text-neutral-600">
                        {selectedFile &&
                          (selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>

                    {/* Thumbnail selection */}
                    {/* <div className="mt-4 pt-4 border-t border-neutral-200">
                      <h3 className="font-medium mb-2">Custom Thumbnail</h3>
                      {selectedThumbnail ? (
                        <div className="relative">
                          <div className="aspect-video w-full bg-neutral-200 rounded mb-2 overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedThumbnail)}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-neutral-600 truncate flex-1">
                              {selectedThumbnail.name}
                            </p>
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={() => setSelectedThumbnail(null)}
                            >
                              <span className="sr-only">Remove</span>×
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-neutral-500 mb-2">
                            Upload a custom thumbnail (optional)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={triggerThumbnailInput}
                          >
                            Select Image
                          </Button>
                          <input
                            type="file"
                            ref={thumbnailInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleThumbnailSelect}
                          />
                          <p className="text-xs text-neutral-500 mt-2">
                            Supported formats: JPG, PNG
                          </p>
                        </div>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 border-t border-neutral-200 pt-4 gap-2">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Step 3: Publishing */}
        {currentStep === UploadStep.Publishing && (
          <div className="text-center py-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">
                Uploading your file...
              </h3>
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-sm text-neutral-600 mt-2">
                {uploadProgress}% complete
              </p>
            </div>

            <div className="bg-neutral-100 rounded-lg p-4 max-w-md mx-auto text-left mb-6">
              <h4 className="font-medium">File Details</h4>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <p className="text-sm text-neutral-600">Title:</p>
                <p className="text-sm col-span-2 font-medium">
                  {form.getValues("title")}
                </p>

                <p className="text-sm text-neutral-600">Size:</p>
                <p className="text-sm col-span-2">
                  {selectedFile &&
                    (selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === UploadStep.Complete && (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
            <p className="text-neutral-600 mb-6">
              Your file has been uploaded to Stratos Decentralized Storage
            </p>

            <div className="bg-neutral-100 rounded-lg p-4 max-w-md mx-auto text-left mb-6">
              <h4 className="font-medium">File Details</h4>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-600">SPFS URI:</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (uploadedVideo?.fileUri) {
                          navigator.clipboard.writeText(uploadedVideo.fileUri);
                          alert("SPFS URI copied!");
                        }
                      }}
                      className="
                        px-3 py-1.5
                        bg-gray-100 hover:bg-gray-200 
                        rounded-lg
                        flex items-center justify-center 
                        space-x-2
                        transition-all duration-200
                        hover:shadow-md
                        hover:scale-105
                      "
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                    {uploadedVideo?.fileUri || "-"}
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-600">File Hash:</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (uploadedVideo?.fileHash) {
                          navigator.clipboard.writeText(uploadedVideo.fileHash);
                          alert("File Hash copied!");
                        }
                      }}
                      className="
                        px-3 py-1.5
                        bg-gray-100 hover:bg-gray-200 
                        rounded-lg
                        flex items-center justify-center 
                        space-x-2
                        transition-all duration-200
                        hover:shadow-md
                        hover:scale-105
                      "
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                    {uploadedVideo?.fileHash || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {/* <Button
                onClick={viewVideo}
                className="bg-primary hover:bg-primary/90"
              >
                View Video
              </Button> */}
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Wrap the component with withOptionalAuth HOC to provide auth context
const UploadModal = withOptionalAuth(UploadModalComponent);

export default UploadModal;
