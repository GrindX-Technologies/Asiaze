import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Setting.find({});
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, group, description } = req.body;
    let setting = await Setting.findOne({ key });

    if (setting) {
      setting.value = value;
      setting.group = group || setting.group;
      setting.description = description || setting.description;
      setting.updatedBy = (req as any).user._id;
      const updatedSetting = await setting.save();
      res.json(updatedSetting);
    } else {
      const newSetting = new Setting({
        key,
        value,
        group,
        description,
        updatedBy: (req as any).user._id
      });
      const createdSetting = await newSetting.save();
      res.status(201).json(createdSetting);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
