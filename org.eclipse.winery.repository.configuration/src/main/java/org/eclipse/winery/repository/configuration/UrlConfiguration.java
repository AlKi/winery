/*******************************************************************************
 * Copyright (c) 2017-2018 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 *******************************************************************************/

package org.eclipse.winery.repository.configuration;

import java.util.Objects;

import org.apache.commons.configuration2.Configuration;

public class UrlConfiguration {

    private String repositoryApiUrl = "http://localhost:8080/winery";
    private String repositoryUiUrl = "http://localhost:8080/#";
    private String bpmn4ToscaModelerUrl = "http://localhost:8080/winery-workflowmodeler";
    private String topologyModelerUrl = "http://localhost:8080/winery-topoloymodeler";
    private String containerApiUrl = "http://container:1337";

    public UrlConfiguration() {
    }

    public UrlConfiguration(Configuration configuration) {
        this.setBpmn4ToscaModelerUrl(configuration.getString(Environment.KEY_URL_BPMN4TOSCA_MODELER, null));
        this.setRepositoryUiUrl(configuration.getString(Environment.KEY_URL_REPOSITORY_UI, null));
        this.setTopologyModelerUrl(configuration.getString(Environment.KEY_URL_TOPOLOGY_MODELER, null));
        this.setContainerApiUrl(configuration.getString(Environment.KEY_URL_CONTAINER_API, null));
    }

    public String getRepositoryApiUrl() {
        return repositoryApiUrl;
    }

    public void setRepositoryApiUrl(String repositoryApiUrl) {
        this.repositoryApiUrl = Objects.requireNonNull(repositoryApiUrl);
    }

    public String getRepositoryUiUrl() {
        return repositoryUiUrl;
    }

    public void setRepositoryUiUrl(String repositoryUiUrl) {
        this.repositoryUiUrl = Objects.requireNonNull(repositoryUiUrl);
    }

    public String getBpmn4ToscaModelerUrl() {
        return bpmn4ToscaModelerUrl;
    }

    public void setBpmn4ToscaModelerUrl(String bpmn4ToscaModelerUrl) {
        this.bpmn4ToscaModelerUrl = Objects.requireNonNull(bpmn4ToscaModelerUrl);
    }

    public String getTopologyModelerUrl() {
        return topologyModelerUrl;
    }

    public void setTopologyModelerUrl(String topologyModelerUrl) {
        this.topologyModelerUrl = Objects.requireNonNull(topologyModelerUrl);
    }

    public String getContainerApiUrl() {
        return containerApiUrl;
    }

    public void setContainerApiUrl(String containerApiUrl) {
        this.containerApiUrl = Objects.requireNonNull(containerApiUrl);
    }

    public void update(Configuration configuration) {
        configuration.setProperty(Environment.KEY_URL_BPMN4TOSCA_MODELER, this.getBpmn4ToscaModelerUrl());
        configuration.setProperty(Environment.KEY_URL_TOPOLOGY_MODELER, this.getTopologyModelerUrl());
        configuration.setProperty(Environment.KEY_URL_CONTAINER_API, this.getContainerApiUrl());
    }
}
