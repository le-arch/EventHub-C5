'use client'

import { UseFormReturn } from 'react-hook-form'
import { Key, Lock, Eye, EyeOff, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { PasswordFormValues } from '@/components/settings/ProfileSettingsTab'

interface SecuritySettingsTabProps {
  passwordForm: UseFormReturn<PasswordFormValues>
  isChangingPassword: boolean
  showCurrentPassword: boolean
  setShowCurrentPassword: (v: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (v: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (v: boolean) => void
  onChangePassword: (data: PasswordFormValues) => void
  onDeleteAccount: () => void
  showDeleteDialog: boolean
  setShowDeleteDialog: (v: boolean) => void
}

export default function SecuritySettingsTab({
  passwordForm,
  isChangingPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onChangePassword,
  onDeleteAccount,
  showDeleteDialog,
  setShowDeleteDialog,
}: SecuritySettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500 border-border/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border/50">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Change Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Regularly cycle passwords to insulate parameters against system vector attacks.
          </CardDescription>
        </CardHeader>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  {...passwordForm.register('currentPassword')}
                  className="pl-11 pr-10 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground p-1 rounded-md transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
              <div className="relative group">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...passwordForm.register('newPassword')}
                  className="pl-11 pr-10 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground p-1 rounded-md transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
              <p className="text-[11px] font-medium text-muted-foreground leading-normal bg-muted/50 border border-slate-100 rounded-lg p-2">
                Complexity verification triggers: Requires at least 8 alphanumeric elements containing one localized uppercase item and a dynamic numerical digit value.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
              <div className="relative group">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  {...passwordForm.register('confirmPassword')}
                  className="pl-11 pr-10 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground p-1 rounded-md transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-6 md:p-8 bg-muted/50/30 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={isChangingPassword} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium px-5 shadow-sm">
              <Key className="h-4 w-4 mr-2" />
              {isChangingPassword ? 'Updating...' : 'Update Password Security'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border border-rose-100 bg-rose-50/20 rounded-2xl overflow-hidden shadow-none">
        <CardHeader className="p-6 md:p-8 border-b border-rose-100/60 bg-rose-50/40">
          <CardTitle className="text-rose-700 text-xl font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            Danger Mitigation Zone
          </CardTitle>
          <CardDescription className="text-rose-600/80 text-sm">
            Destructive operational configuration adjustments. Proceed with absolute certainty.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <p className="font-bold text-foreground">Close Account System Linkages</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Permanently drop individual structural access instances. Purgatory process yields instant removal across multi-region databases.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 active:scale-98 font-semibold rounded-xl px-5"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Close Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={onDeleteAccount}
        title="Confirm Irrevocable Account Purge"
        description="Are you absolutely sure you want to initialize complete system deletion metrics?"
        confirmText="Initialize Complete Deletion"
        cancelText="Abort Deletion Request"
        variant="danger"
      >
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-left space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-bold text-sm">Irreversible Processing Cascade Active</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-600 font-medium pl-5 list-disc leading-relaxed">
            <li>All event configuration catalogs will drop instantly from indexing endpoints.</li>
            <li>Historical sales registries, financial receipts, and seat distributions dissolve.</li>
            <li>System identity structures lock indefinitely against reuse rules.</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}
