import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../input/input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
	title: "Components/Label",
	component: Label,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A label component for form inputs and other elements.",
			},
		},
	},
	argTypes: {
		children: {
			control: { type: "text" },
			description: "The label text",
		},
		htmlFor: {
			control: { type: "text" },
			description: "The ID of the element this label is for",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Label",
	},
};

export const WithInput: Story = {
	render: () => (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="email">Email</Label>
			<Input id="email" type="email" placeholder="Enter your email" />
		</div>
	),
};

export const WithCheckbox: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<input type="checkbox" id="terms" />
			<Label htmlFor="terms">I agree to the terms and conditions</Label>
		</div>
	),
};

export const WithRadio: Story = {
	render: () => (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<input type="radio" id="option1" name="options" />
				<Label htmlFor="option1">Option 1</Label>
			</div>
			<div className="flex items-center space-x-2">
				<input type="radio" id="option2" name="options" />
				<Label htmlFor="option2">Option 2</Label>
			</div>
			<div className="flex items-center space-x-2">
				<input type="radio" id="option3" name="options" />
				<Label htmlFor="option3">Option 3</Label>
			</div>
		</div>
	),
};
