import DirectionalSignIcon from '@sourcegraph/icons/lib/DirectionalSign'
import * as React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { Redirect } from 'react-router-dom'
import * as GQL from '../backend/graphqlschema'
import { HeroPage } from '../components/HeroPage'
import { ExtensionsProps } from '../extensions/ExtensionsClientCommonContext'
import { SiteAdminAllUsersPage } from './SiteAdminAllUsersPage'
import { SiteAdminAnalyticsPage } from './SiteAdminAnalyticsPage'
import { SiteAdminAuthenticationProvidersPage } from './SiteAdminAuthenticationProvidersPage'
import { SiteAdminCodeIntelligencePage } from './SiteAdminCodeIntelligencePage'
import { SiteAdminConfigurationPage } from './SiteAdminConfigurationPage'
import { SiteAdminCreateUserPage } from './SiteAdminCreateUserPage'
import { SiteAdminExternalAccountsPage } from './SiteAdminExternalAccountsPage'
import { SiteAdminOrgsPage } from './SiteAdminOrgsPage'
import { SiteAdminOverviewPage } from './SiteAdminOverviewPage'
import { SiteAdminPingsPage } from './SiteAdminPingsPage'
import { SiteAdminRegistryExtensionsPage } from './SiteAdminRegistryExtensionsPage'
import { SiteAdminRepositoriesPage } from './SiteAdminRepositoriesPage'
import { SiteAdminSettingsPage } from './SiteAdminSettingsPage'
import { SiteAdminSidebar } from './SiteAdminSidebar'
import { SiteAdminSurveyResponsesPage } from './SiteAdminSurveyResponsesPage'
import { SiteAdminTokensPage } from './SiteAdminTokensPage'
import { SiteAdminUpdatesPage } from './SiteAdminUpdatesPage'

const NotFoundPage = () => (
    <HeroPage
        icon={DirectionalSignIcon}
        title="404: Not Found"
        subtitle="Sorry, the requested site admin page was not found."
    />
)

const NotSiteAdminPage = () => (
    <HeroPage icon={DirectionalSignIcon} title="403: Forbidden" subtitle="Only site admins are allowed here." />
)

interface Props extends RouteComponentProps<{}>, ExtensionsProps {
    user: GQL.IUser | null
    isLightTheme: boolean
}

/**
 * Renders a layout of a sidebar and a content area to display site admin information.
 */
export class SiteAdminArea extends React.Component<Props> {
    public render(): JSX.Element | null {
        // If not logged in, redirect to sign in.
        if (!this.props.user) {
            const newUrl = new URL(window.location.href)
            newUrl.pathname = '/sign-in'
            // Return to the current page after sign up/in.
            newUrl.searchParams.set('returnTo', window.location.href)
            return <Redirect to={newUrl.pathname + newUrl.search} />
        }

        // If not site admin, redirect to sign in.
        if (!this.props.user.siteAdmin) {
            return <NotSiteAdminPage />
        }

        const transferProps = {
            user: this.props.user,
            isLightTheme: this.props.isLightTheme,
            site: { __typename: 'Site' as GQL.ISite['__typename'], id: window.context.siteGQLID },
        }

        return (
            <div className="site-admin-area area">
                <SiteAdminSidebar
                    className="area__sidebar"
                    history={this.props.history}
                    location={this.props.location}
                    user={this.props.user}
                />
                <div className="area__content">
                    <Switch>
                        {/* Render empty page if no page selected. */}
                        <Route path={this.props.match.url} component={SiteAdminOverviewPage} exact={true} />
                        <Route
                            path={`${this.props.match.url}/configuration`}
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <SiteAdminConfigurationPage {...routeComponentProps} {...transferProps} />
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/global-settings`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <SiteAdminSettingsPage
                                    {...routeComponentProps}
                                    {...transferProps}
                                    extensions={this.props.extensions}
                                />
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/repositories`}
                            component={SiteAdminRepositoriesPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/auth/providers`}
                            component={SiteAdminAuthenticationProvidersPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/auth/external-accounts`}
                            component={SiteAdminExternalAccountsPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/code-intelligence`}
                            component={SiteAdminCodeIntelligencePage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/organizations`}
                            component={SiteAdminOrgsPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/users`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <SiteAdminAllUsersPage {...routeComponentProps} {...transferProps} />
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/users/new`}
                            component={SiteAdminCreateUserPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/tokens`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <SiteAdminTokensPage {...routeComponentProps} {...transferProps} />
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/registry/extensions`}
                            component={SiteAdminRegistryExtensionsPage}
                            exact={true}
                        />
                        <Route
                            path={`${this.props.match.url}/analytics`}
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <SiteAdminAnalyticsPage {...routeComponentProps} {...transferProps} />
                            )}
                        />
                        <Route path={`${this.props.match.url}/updates`} component={SiteAdminUpdatesPage} exact={true} />
                        <Route path={`${this.props.match.url}/pings`} component={SiteAdminPingsPage} exact={true} />
                        <Route
                            path={`${this.props.match.url}/surveys`}
                            exact={true}
                            component={SiteAdminSurveyResponsesPage}
                        />
                        <Route component={NotFoundPage} />
                    </Switch>
                </div>
            </div>
        )
    }
}