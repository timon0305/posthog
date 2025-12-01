import { CopyToClipboardInline } from 'lib/components/CopyToClipboard'
import { LemonTableLink } from 'lib/lemon-ui/LemonTable/LemonTableLink'
import { lemonToast } from 'lib/lemon-ui/LemonToast'
import { ButtonPrimitive } from 'lib/ui/Button/ButtonPrimitives'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuTrigger,
} from 'lib/ui/ContextMenu/ContextMenu'
import stringWithWBR from 'lib/utils/stringWithWBR'
import { sceneLogic } from 'scenes/sceneLogic'
import { urls } from 'scenes/urls'

interface GroupNameCellProps {
    groupTypeIndex: number
    groupKey: string
    groupName: string
}

export function GroupNameCell({ groupTypeIndex, groupKey, groupName }: GroupNameCellProps): JSX.Element {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className="min-w-40">
                    <LemonTableLink to={urls.group(groupTypeIndex, groupKey)} title={groupName} />
                    <CopyToClipboardInline
                        explicitValue={groupKey}
                        iconStyle={{ color: 'var(--color-accent)' }}
                        description="group id"
                    >
                        {stringWithWBR(groupKey, 100)}
                    </CopyToClipboardInline>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent asChild className="max-w-[300px]">
                <GroupMenuItems href={urls.group(groupTypeIndex, groupKey)} groupKey={groupKey} />
            </ContextMenuContent>
        </ContextMenu>
    )
}

interface GroupMenuItemsProps {
    href: string
    groupKey: string
}

function GroupMenuItems({ href, groupKey }: GroupMenuItemsProps): JSX.Element {
    return (
        <ContextMenuGroup>
            <ContextMenuItem
                asChild
                onClick={(e) => {
                    e.stopPropagation()
                    sceneLogic.findMounted()?.actions.newTab(href)
                }}
                data-attr="group-menu-open-link-button"
            >
                <ButtonPrimitive menuItem>Open group in new PostHog tab</ButtonPrimitive>
            </ContextMenuItem>
            <ContextMenuItem
                asChild
                onClick={(e) => {
                    e.stopPropagation()
                    window.open(href, '_blank')
                }}
                data-attr="group-menu-open-link-button"
            >
                <ButtonPrimitive menuItem>Open group in new browser tab</ButtonPrimitive>
            </ContextMenuItem>
            <ContextMenuItem
                asChild
                onClick={(e) => {
                    e.stopPropagation()
                    void navigator.clipboard.writeText(document.location.origin + href)
                    lemonToast.success('Link copied to clipboard')
                }}
                data-attr="group-menu-copy-link-button"
            >
                <ButtonPrimitive menuItem>Copy group link</ButtonPrimitive>
            </ContextMenuItem>
            <ContextMenuItem
                asChild
                onClick={(e) => {
                    e.stopPropagation()
                    void navigator.clipboard.writeText(groupKey)
                    lemonToast.success('Group key copied to clipboard')
                }}
                data-attr="group-menu-copy-group-key-button"
            >
                <ButtonPrimitive menuItem>Copy group key</ButtonPrimitive>
            </ContextMenuItem>
        </ContextMenuGroup>
    )
}
