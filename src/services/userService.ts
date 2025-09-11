import { userDetailDTO } from "../dtos/user/userDetailDTO";
import User from "../models/user"

export const findUserById = async (userId: string) => {
    const user = await User.findOne({ _id: userId }).select("_id name username bio profileUrl email");
    return user;
}

export const updateUserDetails = async (userDetail: userDetailDTO) => {
    const query = { _id: userDetail.id };

    const updateFields: Record<string, any> = {
        name: userDetail.name,
        username: userDetail.username,
    };

    if (userDetail.bio !== "" && userDetail.bio !== null && userDetail.bio !== undefined) {
        updateFields.bio = userDetail.bio;
    }

    if (userDetail.profileUrl !== "" && userDetail.profileUrl !== null && userDetail.profileUrl !== undefined) {
        updateFields.profileUrl = userDetail.profileUrl;
    }
    console.log(updateFields);
    console.log(userDetail.id);
    console.log("userdetaisl:", userDetail);
    
    const update = {
        $set: updateFields
    };
    const result = await User.updateOne(query, update);
    console.log(result);
    if (!result) {
        return { success: false, message: "failed to update user details" };
    }
    return { success: true, user: await findUserById(userDetail.id) };
}

export const deleteUser = async (userId: string) => {
    const result = await User.deleteOne({ _id: userId });
    console.log(result);
    if (!result) {
        return { success: false, message: "failed to update user details" };
    }
    return { success: true };
}

export const searchUsers = async (searchQuery: string, currentUserId: string) => {
  // Trim query for better UX
  const trimmedQuery = searchQuery.trim();

  if (!trimmedQuery) {
    return [];
  }

  // Validate currentUserId
  if (!currentUserId) {
    throw new Error("Invalid current user ID");
  }

  // Search only users whose username, name, or email starts with the searchQuery
  const users = await User.find({
    _id: { $ne: currentUserId }, // exclude the current user
    $or: [
      { username: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { name: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { email: { $regex: `^${trimmedQuery}`, $options: "i" } },
    ],
  })
    .select("_id name username email profileUrl") // only return required fields
    .limit(20); // limit results for performance

  return users;
};
