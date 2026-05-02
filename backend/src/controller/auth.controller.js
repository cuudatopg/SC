import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl } = req.body;
        const fullName = `${firstName || ""} ${lastName || ""}`.trim();

        let user = await User.findOne({ clerkId: id });

        if (!user) {
            await User.create({
                clerkId: id,
                fullName,
                imageUrl,
            });
        } else {
            const isNameChanged = user.fullName !== fullName;
            const isImageChanged = user.imageUrl !== imageUrl;

            if (isNameChanged || isImageChanged) {
                await User.findOneAndUpdate(
                    { clerkId: id },
                    { 
                        fullName: fullName,
                        imageUrl: imageUrl 
                    },
                    { new: true } 
                );
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error in auth callback", error);
        next(error);
    }
};