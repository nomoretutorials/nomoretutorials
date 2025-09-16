import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";
import React, { useMemo } from "react";

// TODO: Change the seed to user random id from prisma
// TODO: Add Dropdown Menu on Hover and Click

const UserAvatar = () => {
  const seed = "ronit";

  const avatarSvg = useMemo(() => {
    return createAvatar(glass, {
      seed,
      radius: 50,
    }).toString();
  }, [seed]);

  const avatarUri = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;
  return (
    <div
      className="size-10 
        rounded-full 
        overflow-hidden 
        flex items-center justify-center 
        cursor-pointer 
        transition-transform duration-200 ease-in-out 
        hover:scale-110 
        active:scale-95"
    >
      <Image src={avatarUri} alt="User Avatar" width={"38"} height={"38"} />
    </div>
  );
};

export default UserAvatar;
