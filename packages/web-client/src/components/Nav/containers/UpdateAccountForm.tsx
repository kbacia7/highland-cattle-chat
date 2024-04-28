import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAccountSchema } from "@highland-cattle-chat/shared";

import { saveUserAccountSettingsToIDB } from "@slices/user/slice";
import { useUpdateAccountMutation } from "@slices/user/api";

import Input from "@components/Input";
import Button from "@components/Button";
import BasicForm from "@components/BasicForm";
import ProfileImage from "@components/ProfileImage";

import { useToast } from "@contexts/ToastMessagesContext";

import { useAppDispatch, useAppSelector } from "@slices/hooks";
import isKnownServerSideError from "@utils/isKnownServerSideError";

import type { z } from "zod";

type Inputs = z.infer<typeof updateAccountSchema>;

const UpdateAccountForm = () => {
  const [updateAccount] = useUpdateAccountMutation();
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const { displayName, email, profilePicture } = useAppSelector(
    (state) => state.user,
  );

  const [profilePicturePreview, setProfilePicturePreview] = useState(
    profilePicture || "",
  );

  const {
    register,
    watch,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(updateAccountSchema),
    shouldFocusError: false,
    defaultValues: {
      displayName,
      email,
    },
    reValidateMode: "onSubmit",
  });

  const watchProfilePicture = watch("profilePicture");

  useEffect(() => {
    watchProfilePicture &&
      watchProfilePicture[0] &&
      setProfilePicturePreview(URL.createObjectURL(watchProfilePicture[0]));
  }, [watchProfilePicture]);

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const { ref: reactFormInputFileRef, ...inputFileProps } =
    register("profilePicture");

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const formData = new FormData();

      formData.append("profilePicture", data.profilePicture[0]);
      formData.append("displayName", data.displayName);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const {
        displayName,
        image: profilePicture,
        email,
        id: userId,
      } = await updateAccount(formData).unwrap();
      addToast({
        type: "success",
        message: "You have successfully updated account",
        timeout: 5000,
      });

      await dispatch(
        saveUserAccountSettingsToIDB({
          userId,
          displayName,
          email,
          profilePicture,
        }),
      ).unwrap();
    } catch (error) {
      if (isKnownServerSideError(error)) {
        setError("root", {
          message: error.data.error,
        });
      }
    }
  };

  return (
    <>
      <p className="text-base">
        Here you can update your profile picture, change display name or reset
        password
      </p>

      <BasicForm<Inputs> control={control} onSubmit={handleSubmit(onSubmit)}>
        <div className="first:pt-4 pb-4 flex justify-center">
          <button type="button">
            <ProfileImage
              src={profilePicturePreview}
              size={150}
              onClick={() => {
                inputFileRef.current?.click();
              }}
            />
          </button>

          <Input
            ref={(e) => {
              reactFormInputFileRef(e);
              inputFileRef.current = e;
            }}
            type="file"
            className="hidden"
            {...inputFileProps}
            // error={!!errors.profilePicture}
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Display name"
            {...register("displayName")}
            error={!!errors.displayName}
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="E-mail"
            {...register("email")}
            error={!!errors.email}
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Password"
            {...register("password")}
            error={!!errors.password}
            type="password"
          />
        </div>

        <div className="pt-3 pb-4 text-center">
          <Button type="submit" color="primary">
            Save
          </Button>
        </div>
      </BasicForm>
    </>
  );
};

export default UpdateAccountForm;
