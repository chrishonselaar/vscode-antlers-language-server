import { IProjectDetailsProvider } from './projectDetailsProvider';
import { IProjectFields } from './structuredFieldTypes/types';

class ProjectManager {
    public static instance: ProjectManager | null = null;
    private currentStructure: IProjectDetailsProvider | null = null;
    private isReloading = false;
    private isDirtyState = true;
    private structuredProject: IProjectFields | null = null;

    setStructuredProject(fields: IProjectFields) {
        this.structuredProject = fields;
    }

    getStructuredProject(): IProjectFields | null {
        return this.structuredProject;
    }

    setActiveProject(project: IProjectDetailsProvider) {
        this.currentStructure = project;
    }

    getStructure(): IProjectDetailsProvider {
        return this.currentStructure as IProjectDetailsProvider;
    }

    hasStructure(): boolean {
        return this.currentStructure != null;
    }

    setDirtyState(isDirty: boolean) {
        this.isDirtyState = isDirty;
    }

    /**
     * Requests the project structure implementation to reload its information.
     */
    reloadDetails() {
        if (this.isReloading) {
            return;
        }

        if (this.isDirtyState == false) {
            return;
        }

        if (this.currentStructure != null) {
            this.isReloading = true;
            this.currentStructure = this.currentStructure.reloadDetails();
            this.isReloading = false;
            this.isDirtyState = false;
        }
    }
}

if (typeof ProjectManager.instance == 'undefined' || ProjectManager.instance == null) {
    ProjectManager.instance = new ProjectManager();
}

export default ProjectManager;
