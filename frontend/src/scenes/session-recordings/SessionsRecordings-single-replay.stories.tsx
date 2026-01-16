import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { useActions } from 'kea'
import { combineUrl } from 'kea-router'
import { useEffect } from 'react'

import { App } from 'scenes/App'
import { playerSettingsLogic } from 'scenes/session-recordings/player/playerSettingsLogic'
import { urls } from 'scenes/urls'

import { mswDecorator } from '~/mocks/browser'
import { SessionRecordingSidebarStacking } from '~/types'

import recordingEventsJson from './__mocks__/recording_events_query'
import { recordingMetaJson } from './__mocks__/recording_meta'
import { snapshotsAsJSONLines } from './__mocks__/recording_snapshots'
import { recordings } from './__mocks__/recordings'

const sceneUrl = (url: string, searchParams: Record<string, any> = {}): string =>
    combineUrl(url, {
        pause: true,
        t: 7,
        ...searchParams,
    }).url

const meta: Meta = {
    component: App,
    title: 'Replay/Single Recording',
    parameters: {
        layout: 'fullscreen',
        viewMode: 'story',
        mockDate: '2023-02-01',
        waitForSelector: '.PlayerFrame__content .replayer-wrapper iframe',
    },
    decorators: [
        mswDecorator({
            get: {
                '/api/environments/:team_id/session_recordings/:id/snapshots': (req, res, ctx) => {
                    // with source=blob_v2, returns snapshots
                    if (req.url.searchParams.get('source') === 'blob_v2') {
                        return res(ctx.text(snapshotsAsJSONLines()))
                    }
                    // with no source requested should return sources
                    return [
                        200,
                        {
                            sources: [
                                {
                                    source: 'blob_v2',
                                    start_timestamp: '2023-08-11T12:03:36.097000Z',
                                    end_timestamp: '2023-08-11T12:04:52.268000Z',
                                    blob_key: '0',
                                },
                            ],
                        },
                    ]
                },
                '/api/environments/:team_id/session_recordings/:id': recordingMetaJson,
                'api/projects/:team/notebooks': {
                    count: 0,
                    next: null,
                    previous: null,
                    results: [],
                },
            },
            post: {
                '/api/environments/:team_id/query': (req, res, ctx) => {
                    const body = req.body as Record<string, any>

                    if (body.query.kind === 'EventsQuery' && body.query.properties.length === 1) {
                        return res(ctx.json(recordingEventsJson))
                    }

                    // default to an empty response
                    return res(ctx.json({ results: [] }))
                },
            },
        }),
    ],
}
export default meta

type Story = StoryObj<typeof meta>

export const SingleRecordingDefault: Story = {
    parameters: {
        pageUrl: sceneUrl(urls.replaySingle(recordings[0].id)),
    },
}

/**
 * Test case for the bug fix: Single replay with sidebar docked to bottom
 * This ensures the player video is visible and layout works correctly when
 * the Activity panel is docked to the bottom in a single replay tab.
 *
 * Regression test for: https://github.com/PostHog/posthog/issues/[issue-number]
 */
export const SingleRecordingDockedToBottom: StoryFn = () => {
    const { setPreferredSidebarStacking, setSidebarOpen } = useActions(playerSettingsLogic)

    useEffect(() => {
        setSidebarOpen(true)
        setPreferredSidebarStacking(SessionRecordingSidebarStacking.Vertical)
    }, [setPreferredSidebarStacking, setSidebarOpen])

    return <App />
}

SingleRecordingDockedToBottom.parameters = {
    pageUrl: sceneUrl(urls.replaySingle(recordings[0].id)),
}

/**
 * Test case: Single replay with sidebar closed
 * Ensures the player takes full width when sidebar is closed.
 */
export const SingleRecordingSidebarClosed: StoryFn = () => {
    const { setSidebarOpen } = useActions(playerSettingsLogic)

    useEffect(() => {
        setSidebarOpen(false)
    }, [setSidebarOpen])

    return <App />
}

SingleRecordingSidebarClosed.parameters = {
    pageUrl: sceneUrl(urls.replaySingle(recordings[0].id)),
}
