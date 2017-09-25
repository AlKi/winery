/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v20.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WineryLoaderModule } from '../../../wineryLoader/wineryLoader.module';
import { WineryModalModule } from '../../../wineryModalModule/winery.modal.module';
import { WineryPipesModule } from '../../../wineryPipes/wineryPipes.module';
import { TemplatesOfTypeComponent } from './templatesOfTypes.component';
import { WineryTableModule } from '../../../wineryTableModule/wineryTable.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        WineryLoaderModule,
        WineryModalModule,
        WineryPipesModule,
        WineryTableModule
    ],
    declarations: [
        TemplatesOfTypeComponent
    ],
    providers: [],
})
export class TemplatesOfTypeModule {
}