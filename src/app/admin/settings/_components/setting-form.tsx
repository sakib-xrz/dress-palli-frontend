"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

import { useInitSettings, useUpdateSettings } from "@/hooks/use-settings";
import type { Setting } from "@/lib/type";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ── Schema ──────────────────────────────────────────────

const initFormSchema = z.object({
  logo: z.instanceof(File).optional(),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
});

const updateFormSchema = z.object({
  logo: z.instanceof(File).optional(),
  favicon: z.instanceof(File).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  facebook: z.string().url().optional().nullable().or(z.literal("")),
  instagram: z.string().url().optional().nullable().or(z.literal("")),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords: z.string().min(1).optional(),
  show_featured_products: z.boolean().optional(),
  show_new_arrivals: z.boolean().optional(),
  show_best_selling: z.boolean().optional(),
  google_analytics_id: z.string().optional().nullable().or(z.literal("")),
  google_tag_manager_id: z.string().optional().nullable().or(z.literal("")),
  facebook_pixel_id: z.string().optional().nullable().or(z.literal("")),
  delivery_charge_inside_dhaka: z.optional(z.number().min(0)),
  delivery_charge_outside_dhaka: z.optional(z.number().min(0)),
});

type InitFormValues = z.infer<typeof initFormSchema>;
type UpdateFormValues = z.infer<typeof updateFormSchema>;

// ── Props ───────────────────────────────────────────────

interface SettingFormProps {
  setting?: Setting | null;
  isInit: boolean;
}

// ── Component ───────────────────────────────────────────

export function SettingForm({ setting, isInit }: SettingFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const initMutation = useInitSettings();
  const updateMutation = useUpdateSettings();

  const isPending = initMutation.isPending || updateMutation.isPending;

  const initForm = useForm<InitFormValues>({
    resolver: zodResolver(initFormSchema),
    defaultValues: {
      address: "",
      phone: "",
      email: "",
      title: "",
      description: "",
      keywords: "",
    },
  });

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      address: "",
      phone: "",
      email: "",
      facebook: "",
      instagram: "",
      title: "",
      description: "",
      keywords: "",
      show_featured_products: true,
      show_new_arrivals: true,
      show_best_selling: true,
      google_analytics_id: "",
      google_tag_manager_id: "",
      facebook_pixel_id: "",
      delivery_charge_inside_dhaka: 70,
      delivery_charge_outside_dhaka: 130,
    },
  });

  useEffect(() => {
    if (isInit) {
      initForm.reset({
        address: "",
        phone: "",
        email: "",
        title: "",
        description: "",
        keywords: "",
      });
      queueMicrotask(() => {
        setLogoPreview(null);
        setFaviconPreview(null);
      });
    } else if (setting) {
      updateForm.reset({
        address: setting.address,
        phone: setting.phone,
        email: setting.email,
        facebook: setting.facebook || "",
        instagram: setting.instagram || "",
        title: setting.title,
        description: setting.description,
        keywords: setting.keywords,
        show_featured_products: setting.show_featured_products,
        show_new_arrivals: setting.show_new_arrivals,
        show_best_selling: setting.show_best_selling,
        google_analytics_id: setting.google_analytics_id || "",
        google_tag_manager_id: setting.google_tag_manager_id || "",
        facebook_pixel_id: setting.facebook_pixel_id || "",
        delivery_charge_inside_dhaka: Number(
          setting.delivery_charge_inside_dhaka,
        ),
        delivery_charge_outside_dhaka: Number(
          setting.delivery_charge_outside_dhaka,
        ),
      });
      const logo = setting.logo || null;
      const favicon = setting.favicon || null;
      queueMicrotask(() => {
        setLogoPreview(logo);
        setFaviconPreview(favicon);
      });
    }
  }, [setting, isInit, initForm, updateForm]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isInit) initForm.setValue("logo", file);
      else updateForm.setValue("logo", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateForm.setValue("favicon", file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const onSubmitInit = async (values: InitFormValues) => {
    await initMutation.mutateAsync({
      logo: values.logo,
      address: values.address,
      phone: values.phone,
      email: values.email,
      title: values.title,
      description: values.description,
      keywords: values.keywords,
    });
  };

  const onSubmitUpdate = async (values: UpdateFormValues) => {
    const payload: Parameters<typeof updateMutation.mutateAsync>[0] = {};
    if (values.logo) payload.logo = values.logo;
    if (values.favicon) payload.favicon = values.favicon;
    if (values.address !== undefined) payload.address = values.address;
    if (values.phone !== undefined) payload.phone = values.phone;
    if (values.email !== undefined) payload.email = values.email;
    if (values.facebook !== undefined)
      payload.facebook = values.facebook || null;
    if (values.instagram !== undefined)
      payload.instagram = values.instagram || null;
    if (values.title !== undefined) payload.title = values.title;
    if (values.description !== undefined)
      payload.description = values.description;
    if (values.keywords !== undefined) payload.keywords = values.keywords;
    if (values.show_featured_products !== undefined)
      payload.show_featured_products = values.show_featured_products;
    if (values.show_new_arrivals !== undefined)
      payload.show_new_arrivals = values.show_new_arrivals;
    if (values.show_best_selling !== undefined)
      payload.show_best_selling = values.show_best_selling;
    if (values.google_analytics_id !== undefined)
      payload.google_analytics_id = values.google_analytics_id || null;
    if (values.google_tag_manager_id !== undefined)
      payload.google_tag_manager_id = values.google_tag_manager_id || null;
    if (values.facebook_pixel_id !== undefined)
      payload.facebook_pixel_id = values.facebook_pixel_id || null;
    if (values.delivery_charge_inside_dhaka !== undefined)
      payload.delivery_charge_inside_dhaka =
        values.delivery_charge_inside_dhaka;
    if (values.delivery_charge_outside_dhaka !== undefined)
      payload.delivery_charge_outside_dhaka =
        values.delivery_charge_outside_dhaka;

    await updateMutation.mutateAsync(payload);
  };

  if (isInit) {
    return (
      <Form {...initForm}>
        <form
          onSubmit={initForm.handleSubmit(onSubmitInit)}
          className="space-y-6"
        >
          {/* Branding */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Branding</CardTitle>
              <CardDescription className="text-muted-foreground">
                Logo and favicon for your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={initForm.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-foreground">Logo</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap items-center gap-4">
                        {logoPreview && (
                          <div className="relative h-16 w-40 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={logoPreview}
                              alt="Logo"
                              fill
                              className="object-contain p-4"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-border"
                            onClick={() =>
                              document.getElementById("setting-logo")?.click()
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {logoPreview ? "Change" : "Upload"}
                          </Button>
                          <input
                            id="setting-logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP. Recommended 200×200px
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* General */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">General</CardTitle>
              <CardDescription className="text-muted-foreground">
                Site title, description, and SEO keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={initForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Site Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Store name"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={initForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO description"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={initForm.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO keywords"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Contact</CardTitle>
              <CardDescription className="text-muted-foreground">
                Store address and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={initForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Store address"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={initForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone number"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={initForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Update form
  return (
    <Form {...updateForm}>
      <form
        onSubmit={updateForm.handleSubmit(onSubmitUpdate)}
        className="space-y-6"
      >
        {/* Branding */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Branding</CardTitle>
            <CardDescription className="text-muted-foreground">
              Logo and favicon for your store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={updateForm.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormLabel className="text-foreground">Logo</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap items-center gap-4">
                      {(logoPreview || setting?.logo) && (
                        <div className="relative h-16 w-40 overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={logoPreview || setting?.logo || ""}
                            alt="Logo"
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-border"
                        onClick={() =>
                          document.getElementById("setting-logo")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {logoPreview || setting?.logo ? "Change" : "Upload"}
                      </Button>
                      <input
                        id="setting-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="favicon"
              render={() => (
                <FormItem>
                  <FormLabel className="text-foreground">Favicon</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap items-center gap-4">
                      {(faviconPreview || setting?.favicon) && (
                        <div className="relative h-8 w-8 overflow-hidden rounded border border-border bg-muted">
                          <Image
                            src={faviconPreview || setting?.favicon || ""}
                            alt="Favicon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-border"
                        onClick={() =>
                          document.getElementById("setting-favicon")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {faviconPreview || setting?.favicon
                          ? "Change"
                          : "Upload"}
                      </Button>
                      <input
                        id="setting-favicon"
                        type="file"
                        accept="image/x-icon,image/vnd.microsoft.icon,.ico,image/*"
                        className="hidden"
                        onChange={handleFaviconChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        ICO, PNG. 16×16 or 32×32px recommended
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* General */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">General</CardTitle>
            <CardDescription className="text-muted-foreground">
              Site title, description, and SEO keywords.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={updateForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Site Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Store name"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SEO description"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Keywords</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SEO keywords"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Contact</CardTitle>
            <CardDescription className="text-muted-foreground">
              Store address and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={updateForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Store address"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Facebook URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://facebook.com/..."
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Instagram URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/..."
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Homepage sections */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Homepage</CardTitle>
            <CardDescription className="text-muted-foreground">
              Toggle sections to show on your homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={updateForm.control}
              name="show_featured_products"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <FormLabel className="text-foreground cursor-pointer">
                      Featured Products
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Show featured products section
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="show_new_arrivals"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <FormLabel className="text-foreground cursor-pointer">
                      New Arrivals
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Show new arrivals section
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="show_best_selling"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <FormLabel className="text-foreground cursor-pointer">
                      Best Selling
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Show best selling section
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Delivery</CardTitle>
            <CardDescription className="text-muted-foreground">
              Delivery charges for inside and outside Dhaka.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={updateForm.control}
              name="delivery_charge_inside_dhaka"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Inside Dhaka (৳)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="delivery_charge_outside_dhaka"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Outside Dhaka (৳)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Analytics</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tracking IDs for analytics and marketing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={updateForm.control}
              name="google_analytics_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Google Analytics ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="G-XXXXXXXXXX"
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="google_tag_manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Google Tag Manager ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="GTM-XXXXXXX"
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="facebook_pixel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Facebook Pixel ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pixel ID"
                      className="border-border bg-background"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
