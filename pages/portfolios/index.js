import { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioCard from '@/components/portfolios/PortfolioCard';
import Link from 'next/link';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_PORTFOLIOS, CREATE_PORTFOLIO} from '@/apollo/queries';

const graphDeletePortfolio = (id) => {
    const query = `
        mutation DeletePortfolio {
        deletePortfolio(id: "${id}")
    }
    `
    return axios.post('http://localhost:3000/graphql', { query })
            .then(({data: graph}) => graph.data)
            .then(data => data.deletePortfolio)
}

const graphUpdatePortfolio = (id) => {
    const query = `
    mutation updatePortfolio {
        updatePortfolio(id: "${id}", input: {
            title: "Update Job"
            company: "Update Job"
            companyWebsite: "Update Job"
            location: "Update Job"
            jobTitle: "Update Job"
            description: "Update Job"
            startDate: "Update Job"
            endDate: "Update Job"
        }) {
            _id
            title
            company
            companyWebsite
            location
            jobTitle
            description
            startDate
            endDate
        }
    }`
    return axios.post('http://localhost:3000/graphql', { query })
            .then(({data: graph}) => graph.data)
            .then(data => data.updatePortfolio)
}

const Portfolios = () => {

    const [portfolios, setPortfolios] = useState([]);
    const [getPortfolios, {loading, data}] = useLazyQuery(GET_PORTFOLIOS);
    const [createPortfolio] = useMutation(CREATE_PORTFOLIO, {
        update(cache, {data: {createPortfolio}}) {
            const {portfolios} = cache.readQuery({query: GET_PORTFOLIOS})
            cache.writeQuery({
                query: GET_PORTFOLIOS,
                data: { portfolios: [...portfolios, createPortfolio]}
            })
        }
    });

    // const onPortfolioCreated = (dataC) => setPortfolios([...portfolios, dataC.createPortfolio])
    
    // const [createPortfolio] = useMutation(CREATE_PORTFOLIO, {onCompleted:onPortfolioCreated });

    useEffect(() => {
        getPortfolios();
    }, [])

    if(data && data.portfolios.length > 0 && (portfolios.length === 0 || data.portfolios.length !== portfolios.length)) {
        setPortfolios(data.portfolios);
    }

    if(loading) { 
        return 'loading...' 
    };
    
    const updatePortfolio = async (id) => {
        const updatedPortfolio = await graphUpdatePortfolio(id);
        const index = portfolios.findIndex(p => p._id === id);
        const newPortfolios = [...portfolios];
        newPortfolios[index] = updatedPortfolio;
        setPortfolios(newPortfolios);
    }

    const deletePortfolio = async (id) => {
        const deletedId = await graphDeletePortfolio(id);
        const index = portfolios.findIndex(p => p._id === deletedId);
        const newPortfolios = [...portfolios];
        newPortfolios.splice(index, 1);
        setPortfolios(newPortfolios);
    }

    return (
        <>
            <section className="section-title">
                <div className="px-2">
                    <div className="pt-5 pb-4">
                        <h1>Portfolios</h1>
                    </div>
                </div>
                <button 
                    onClick={createPortfolio}
                    className="btn btn-primary"
                >
                    Create Portfolio
                </button>
            </section>
            <section className="pb-5">
                <div className="row">
                    { portfolios.map(portfolio => (
                        <div key={portfolio._id} className="col-md-4">
                            <Link href={`/portfolios/${portfolio._id}`}>
                                <a className="card-link">
                                <PortfolioCard portfolio={portfolio}/>
                                </a>
                            </Link>
                            <button 
                                className="btn btn-warning" 
                                onClick={()=>updatePortfolio(portfolio._id)}
                            >
                                Update Portfolio
                            </button>
                            <button 
                                className="btn btn-danger" 
                                onClick={()=>deletePortfolio(portfolio._id)}
                            >
                                Delete Portfolio
                            </button>
                        </div>
                        ))
                    }
                </div>
            </section>
        </>
    )
}

export default Portfolios
