import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Icon,
} from "@gluestack-ui/themed";
import type { User } from "firebase/auth";
import { User as UserIcon } from "lucide-react-native";

type UserAvatarProps = {
  user: User | null;
};

export default function UserAvatar({ user = null }: UserAvatarProps) {
  return (
    <Avatar size="md">
      {user ? (
        <>
          <AvatarFallbackText>{user.displayName}</AvatarFallbackText>
          {user.photoURL && (
            <AvatarImage
              source={{
                uri: user.photoURL,
              }}
              alt={user.displayName || "Usuário"}
            />
          )}
        </>
      ) : (
        <Icon as={() => <UserIcon size={24} />} />
      )}
    </Avatar>
  );
}
