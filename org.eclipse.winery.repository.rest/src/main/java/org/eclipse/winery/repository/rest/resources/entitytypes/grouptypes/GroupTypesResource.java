package org.eclipse.winery.repository.rest.resources.entitytypes.grouptypes;

import io.swagger.annotations.Api;
import org.eclipse.winery.repository.rest.resources._support.AbstractComponentsWithoutTypeReferenceResource;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

@Api(tags = "Group Types")
public class GroupTypesResource extends AbstractComponentsWithoutTypeReferenceResource<GroupTypeResource> {

    @Path("{namespace}/{id}/")
    public GroupTypeResource getComponentInstanceResource(@PathParam("namespace") String namespace, @PathParam("id") String id) {
        return this.getComponentInstanceResource(namespace, id, true);
    }
}
